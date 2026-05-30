import { useMemo, useState } from 'react';
import { useGetAddressSearchQuery } from '@shared/api/addressApi';
import type { AddressSuggestion, CountryCode } from '@features/address-onboarding/types';

export function useAddressSearch(selectedCountry: CountryCode | null) {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);

  const canSearch = Boolean(selectedCountry && searchValue.trim().length > 0);

  const { data, isFetching } = useGetAddressSearchQuery(
    {
      query: searchValue,
      countryCode: selectedCountry as CountryCode,
    },
    { skip: !canSearch }
  );

  const suggestions = useMemo(() => data?.suggestions ?? [], [data]);

  const showDropdown = isFocused && canSearch;

  const onSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSearchValue(suggestion.label);
    setIsFocused(false);
    setHoveredSuggestionId(null);
  };

  return {
    searchValue,
    setSearchValue,
    suggestions,
    isFetching,
    showDropdown,
    hoveredSuggestionId,
    setHoveredSuggestionId,
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      window.setTimeout(() => {
        setIsFocused(false);
        setHoveredSuggestionId(null);
      }, 100);
    },
    onSelectSuggestion,
  };
}
