import { Container, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { AddressDetailsSection } from '@features/address-onboarding/components/AddressDetailsSection';
import { AddressEntrySection } from '@features/address-onboarding/components/AddressEntrySection';
import { useAddressSearch } from '@features/address-onboarding/hooks/useAddressSearch';
import { useCountryMetadata } from '@features/address-onboarding/hooks/useCountryMetadata';

export function AddressOnboardingPage() {
  const countrySection = useCountryMetadata();
  const search = useAddressSearch(countrySection.selectedCountry);

  useEffect(() => {
    search.setSearchValue('');
  }, [countrySection.selectedCountry]);

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Global Address Onboarding</Title>
          <Text c="dimmed" size="sm">
            Start by selecting a country, then continue with address details.
          </Text>
        </Stack>

        <AddressEntrySection
          section={countrySection}
          searchValue={search.searchValue}
          setSearchValue={search.setSearchValue}
          onSearchFocus={search.onFocus}
          onSearchBlur={search.onBlur}
          showDropdown={search.showDropdown}
          suggestions={search.suggestions}
          searchLoading={search.isFetching}
          hoveredSuggestionId={search.hoveredSuggestionId}
          setHoveredSuggestionId={search.setHoveredSuggestionId}
          onSelectSuggestion={search.onSelectSuggestion}
        />

        {countrySection.selectedCountry ? (
          <AddressDetailsSection
            fields={countrySection.sortedFields}
            loading={countrySection.metadataLoading}
            error={countrySection.metadataError}
            enabled={!countrySection.metadataLoading && !countrySection.metadataError}
          />
        ) : null}
      </Stack>
    </Container>
  );
}
