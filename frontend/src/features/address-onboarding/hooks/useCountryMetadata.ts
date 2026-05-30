import { useMemo, useState } from 'react';
import { useGetCountriesQuery, useGetMetadataQuery } from '@shared/api/addressApi';
import type { CountryCode } from '@features/address-onboarding/types';

export function useCountryMetadata() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);

  const {
    data: countries,
    isLoading: countriesLoading,
    isError: countriesError,
  } = useGetCountriesQuery();

  const {
    data: metadata,
    isLoading: metadataLoading,
    isError: metadataError,
  } = useGetMetadataQuery(selectedCountry as CountryCode, {
    skip: !selectedCountry,
  });

  const selectData = useMemo(
    () => (countries ?? []).map((country) => ({ value: country.code, label: country.name })),
    [countries]
  );

  const sortedFields = useMemo(
    () => (metadata ? [...metadata.fields].sort((a, b) => a.order - b.order) : []),
    [metadata]
  );

  const onCountryChange = (value: string | null) => {
    setSelectedCountry(value as CountryCode | null);
  };

  return {
    countriesError,
    countriesLoading,
    metadata,
    metadataError,
    metadataLoading,
    onCountryChange,
    selectData,
    selectedCountry,
    sortedFields,
  };
}

export type CountryMetadataState = ReturnType<typeof useCountryMetadata>;
