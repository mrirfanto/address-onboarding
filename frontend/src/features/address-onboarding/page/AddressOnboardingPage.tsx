import { Container, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AddressEntrySection } from '@features/address-onboarding/components/AddressEntrySection';
import { useCountryMetadata } from '@features/address-onboarding/hooks/useCountryMetadata';

export function AddressOnboardingPage() {
  const countrySection = useCountryMetadata();
  const [addressSearch, setAddressSearch] = useState('');

  useEffect(() => {
    setAddressSearch('');
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
          addressSearch={addressSearch}
          onAddressSearchChange={setAddressSearch}
        />
      </Stack>
    </Container>
  );
}
