import { Badge, Card, Grid, Select, Stack, Text, TextInput } from '@mantine/core';
import type { CountryMetadataState } from '@features/address-onboarding/hooks/useCountryMetadata';

type AddressEntrySectionProps = {
  section: CountryMetadataState;
  addressSearch: string;
  onAddressSearchChange: (value: string) => void;
};

export function AddressEntrySection({
  section,
  addressSearch,
  onAddressSearchChange,
}: AddressEntrySectionProps) {
  return (
    <Card withBorder>
      <Stack gap="md">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Country"
              required
              placeholder="Select a country"
              data={section.selectData}
              value={section.selectedCountry}
              onChange={section.onCountryChange}
              disabled={section.countriesLoading || section.countriesError}
            />
            <Text c="dimmed" size="sm" mt="xs">
              Changing country will reset the form.
            </Text>
            {section.countriesLoading ? (
              <Badge color="gray" mt="xs">
                Loading countries...
              </Badge>
            ) : null}
            {section.countriesError ? (
              <Badge color="red" mt="xs">
                Failed to load countries
              </Badge>
            ) : null}
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              label="Search Address"
              placeholder="Start typing to search your address"
              value={addressSearch}
              onChange={(event) => onAddressSearchChange(event.currentTarget.value)}
              disabled={!section.selectedCountry}
            />
            <Text c="dimmed" size="sm" mt="xs">
              Autocomplete integration will be added in later slices.
            </Text>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
