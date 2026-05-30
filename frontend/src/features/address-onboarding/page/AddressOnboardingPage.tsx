import { Alert, Container, Stack, Text, Title } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useCreateAddressMutation, useLazyGetAddressDetailsQuery } from '@shared/api/addressApi';
import { AddressDetailsSection } from '@features/address-onboarding/components/AddressDetailsSection';
import { AddressEntrySection } from '@features/address-onboarding/components/AddressEntrySection';
import { SavedAddressesSection } from '@features/address-onboarding/components/SavedAddressesSection';
import { useAddressForm } from '@features/address-onboarding/hooks/useAddressForm';
import { useAddressSearch } from '@features/address-onboarding/hooks/useAddressSearch';
import { useCountryMetadata } from '@features/address-onboarding/hooks/useCountryMetadata';
import type { ApiError } from '@features/address-onboarding/types';

export function AddressOnboardingPage() {
  const countrySection = useCountryMetadata();
  const search = useAddressSearch(countrySection.selectedCountry);
  const [manualEditEnabled, setManualEditEnabled] = useState(false);
  const [prefillReady, setPrefillReady] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetchDetails] = useLazyGetAddressDetailsQuery();
  const [createAddress, { isLoading: isSubmitting }] = useCreateAddressMutation();
  const lastPrefilledPlaceIdRef = useRef<string | null>(null);

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
    setGlobalError(null);
    setSubmitMessage(null);
    lastPrefilledPlaceIdRef.current = null;
  }, [countrySection.selectedCountry]);

  useEffect(() => {
    async function prefillFromPlace() {
      if (!countrySection.selectedCountry || !search.selectedPlaceId) {
        return;
      }
      if (lastPrefilledPlaceIdRef.current === search.selectedPlaceId) {
        return;
      }

      const response = await fetchDetails({
        placeId: search.selectedPlaceId,
        countryCode: countrySection.selectedCountry,
      });

      if ('data' in response && response.data) {
        form.applyPrefill(response.data.values);
        setPrefillReady(true);
        lastPrefilledPlaceIdRef.current = search.selectedPlaceId;
      }
    }

    void prefillFromPlace();
  }, [countrySection.selectedCountry, fetchDetails, form.applyPrefill, search.selectedPlaceId]);

  useEffect(() => {
    if (!submitMessage || submitMessage.type !== 'success') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitMessage(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [submitMessage]);

  const onSubmit = async () => {
    if (!countrySection.selectedCountry) {
      return;
    }

    setGlobalError(null);
    setSubmitMessage(null);

    try {
      await createAddress({
        countryCode: countrySection.selectedCountry,
        placeId: search.selectedPlaceId ?? undefined,
        values: form.getValues(),
      }).unwrap();

      setSubmitMessage({ type: 'success', text: 'Address saved successfully.' });
      search.resetSearchState();
      setManualEditEnabled(false);
      setPrefillReady(false);
      lastPrefilledPlaceIdRef.current = null;
      form.reset(Object.fromEntries(countrySection.sortedFields.map((field) => [field.key, ''])));
      void form.trigger();
    } catch (error) {
      const apiError = (error as FetchBaseQueryError)?.data as ApiError | undefined;
      const message = apiError?.message ?? 'Failed to save address. Please try again.';

      setSubmitMessage({ type: 'error', text: message });
      setGlobalError(message);
    }
  };

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

        {globalError ? <Alert color="red" title="Submission failed">{globalError}</Alert> : null}

        {countrySection.selectedCountry ? (
          <AddressDetailsSection
            fields={countrySection.sortedFields}
            loading={countrySection.metadataLoading}
            error={countrySection.metadataError}
            enabled={canEditDetails && !countrySection.metadataLoading && !countrySection.metadataError}
            form={form}
            submitLabel="Save Address"
            submitLoading={isSubmitting}
            submitMessage={submitMessage}
            onSubmit={onSubmit}
          />
        ) : null}

        <SavedAddressesSection />
      </Stack>
    </Container>
  );
}
