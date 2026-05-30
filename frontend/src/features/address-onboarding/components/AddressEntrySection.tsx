import { Badge, Box, Button, Card, Grid, Select, Stack, Text, TextInput } from '@mantine/core';
import type { CountryMetadataState } from '@features/address-onboarding/hooks/useCountryMetadata';
import type { AddressSuggestion } from '@features/address-onboarding/types';

type AddressEntrySectionProps = {
  section: CountryMetadataState;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  showDropdown: boolean;
  suggestions: AddressSuggestion[];
  searchLoading: boolean;
  hoveredSuggestionId: string | null;
  setHoveredSuggestionId: (value: string | null) => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onManualEdit: () => void;
};

export function AddressEntrySection({
  section,
  searchValue,
  setSearchValue,
  onSearchFocus,
  onSearchBlur,
  showDropdown,
  suggestions,
  searchLoading,
  hoveredSuggestionId,
  setHoveredSuggestionId,
  onSelectSuggestion,
  onManualEdit,
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
            <Box style={{ position: 'relative' }}>
              <TextInput
                label="Search Address"
                placeholder="Start typing to search your address"
                value={searchValue}
                onChange={(event) => setSearchValue(event.currentTarget.value)}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                disabled={!section.selectedCountry}
              />

              {showDropdown ? (
                <Box
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 8,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                      <Box
                        key={suggestion.placeId}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          onSelectSuggestion(suggestion);
                        }}
                        onMouseEnter={() => setHoveredSuggestionId(suggestion.placeId)}
                        onMouseLeave={() => setHoveredSuggestionId(null)}
                        style={{
                          padding: '10px 12px',
                          fontSize: 14,
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--mantine-color-gray-2)',
                          backgroundColor:
                            hoveredSuggestionId === suggestion.placeId
                              ? 'var(--mantine-color-gray-1)'
                              : 'white',
                          transition: 'background-color 140ms ease',
                        }}
                      >
                        {suggestion.label}
                      </Box>
                    ))
                  ) : (
                    <Text c="dimmed" px="sm" py="xs" size="sm">
                      {searchLoading ? 'Searching...' : 'No suggestions found'}
                    </Text>
                  )}
                </Box>
              ) : null}
            </Box>
            <Text c="dimmed" size="sm" mt="xs">
              Start typing to search and select an address.
            </Text>
            <Button mt="sm" onClick={onManualEdit} size="xs" variant="light">
              Manual Edit
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
