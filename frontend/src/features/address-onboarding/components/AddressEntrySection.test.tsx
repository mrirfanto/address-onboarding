import { fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';
import { AddressEntrySection } from './AddressEntrySection';
import type { CountryMetadataState } from '@features/address-onboarding/hooks/useCountryMetadata';

function buildSection(overrides: Partial<CountryMetadataState> = {}): CountryMetadataState {
  return {
    countriesError: false,
    countriesLoading: false,
    metadata: undefined,
    metadataError: false,
    metadataLoading: false,
    onCountryChange: vi.fn(),
    selectData: [{ value: 'USA', label: 'United States' }],
    selectedCountry: 'USA',
    sortedFields: [],
    ...overrides,
  };
}

describe('AddressEntrySection', () => {
  it('renders suggestions and handles selection + manual edit action', () => {
    const onSelectSuggestion = vi.fn();
    const onManualEdit = vi.fn();
    const setSearchValue = vi.fn();

    render(
      <AddressEntrySection
        section={buildSection()}
        searchValue="apple"
        setSearchValue={setSearchValue}
        onSearchFocus={vi.fn()}
        onSearchBlur={vi.fn()}
        showDropdown
        suggestions={[{ placeId: 'usa_1', label: '1 Apple Park Way, Cupertino, CA, USA' }]}
        searchLoading={false}
        hoveredSuggestionId={null}
        setHoveredSuggestionId={vi.fn()}
        onSelectSuggestion={onSelectSuggestion}
        onManualEdit={onManualEdit}
      />,
      { wrapper: MantineProvider }
    );

    fireEvent.mouseDown(screen.getByText('1 Apple Park Way, Cupertino, CA, USA'));
    expect(onSelectSuggestion).toHaveBeenCalledWith({
      placeId: 'usa_1',
      label: '1 Apple Park Way, Cupertino, CA, USA',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Manual Edit' }));
    expect(onManualEdit).toHaveBeenCalledTimes(1);
  });
});
