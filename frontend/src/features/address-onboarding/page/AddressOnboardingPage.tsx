import { Container, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLazyGetAddressDetailsQuery } from '@shared/api/addressApi';
import { AddressDetailsSection } from '@features/address-onboarding/components/AddressDetailsSection';
import { AddressEntrySection } from '@features/address-onboarding/components/AddressEntrySection';
import { useAddressForm } from '@features/address-onboarding/hooks/useAddressForm';
import { useAddressSearch } from '@features/address-onboarding/hooks/useAddressSearch';
import { useCountryMetadata } from '@features/address-onboarding/hooks/useCountryMetadata';

export function AddressOnboardingPage() {
  const countrySection = useCountryMetadata();
  const search = useAddressSearch(countrySection.selectedCountry);
  const [manualEditEnabled, setManualEditEnabled] = useState(false);
  const [prefillReady, setPrefillReady] = useState(false);
  const [fetchDetails] = useLazyGetAddressDetailsQuery();

  const canEditDetails = manualEditEnabled || prefillReady;

  const form = useAddressForm({
    fields: countrySection.sortedFields,
    enabled:
      canEditDetails &&
      !countrySection.metadataLoading &&
      !countrySection.metadataError,
  });

  useEffect(() => {
    search.resetSearchState();
    setManualEditEnabled(false);
    setPrefillReady(false);
  }, [countrySection.selectedCountry]);

  useEffect(() => {
    async function prefillFromPlace() {
      if (!countrySection.selectedCountry || !search.selectedPlaceId) {
        return;
      }

      const response = await fetchDetails({
        placeId: search.selectedPlaceId,
        countryCode: countrySection.selectedCountry,
      });

      if ('data' in response && response.data) {
        form.applyPrefill(response.data.values);
        setPrefillReady(true);
      }
    }

    void prefillFromPlace();
  }, [countrySection.selectedCountry, fetchDetails, form, search.selectedPlaceId]);

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
          onManualEdit={() => setManualEditEnabled(true)}
        />

        {countrySection.selectedCountry ? (
          <AddressDetailsSection
            fields={countrySection.sortedFields}
            loading={countrySection.metadataLoading}
            error={countrySection.metadataError}
            enabled={canEditDetails && !countrySection.metadataLoading && !countrySection.metadataError}
            form={form}
          />
        ) : null}
      </Stack>
    </Container>
  );
}
