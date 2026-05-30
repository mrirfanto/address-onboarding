import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useGetAddressSearchQuery } from '@shared/api/addressApi';
import type { AddressSuggestion, CountryCode } from '@features/address-onboarding/types';

export function useAddressSearch(selectedCountry: CountryCode | null) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 300);
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const canSearch = Boolean(selectedCountry && debouncedSearchValue.trim().length > 0);

  const { data, isFetching } = useGetAddressSearchQuery(
    {
      query: debouncedSearchValue,
      countryCode: selectedCountry as CountryCode,
    },
    { skip: !canSearch }
  );

  const suggestions = useMemo(() => data?.suggestions ?? [], [data]);

  const showDropdown = isFocused && Boolean(selectedCountry && searchValue.trim().length > 0);

  const onSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSearchValue(suggestion.label);
    setSelectedPlaceId(suggestion.placeId);
    setIsFocused(false);
    setHoveredSuggestionId(null);
  };

  const resetSearchState = () => {
    setSearchValue('');
    setSelectedPlaceId(null);
    setIsFocused(false);
    setHoveredSuggestionId(null);
  };

  return {
    searchValue,
    setSearchValue,
    selectedPlaceId,
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
    resetSearchState,
  };
}
