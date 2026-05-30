import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressOnboardingPage } from './AddressOnboardingPage';

const fetchDetailsMock = vi.fn();
const createAddressMock = vi.fn();

const countryState = {
  countriesError: false,
  countriesLoading: false,
  metadata: undefined,
  metadataError: false,
  metadataLoading: false,
  onCountryChange: vi.fn(),
  selectData: [{ value: 'USA', label: 'United States' }],
  selectedCountry: 'USA' as const,
  sortedFields: [
    {
      key: 'line1',
      title: 'Address Line 1',
      description: null,
      type: 'text' as const,
      required: true,
      order: 1,
      prefix: null,
      suffix: null,
    },
  ],
};

const searchState = {
  searchValue: 'apple',
  setSearchValue: vi.fn(),
  selectedPlaceId: 'usa_2' as string | null,
  suggestions: [{ placeId: 'usa_2', label: '1 Apple Park Way, Cupertino, CA, USA' }],
  isFetching: false,
  showDropdown: false,
  hoveredSuggestionId: null as string | null,
  setHoveredSuggestionId: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  onSelectSuggestion: vi.fn(),
  resetSearchState: vi.fn(),
};

const formState = {
  applyPrefill: vi.fn(),
  getValues: vi.fn(() => ({ line1: '1 Apple Park Way' })),
  reset: vi.fn(),
  trigger: vi.fn(() => Promise.resolve(true)),
  canSubmit: true,
  handleSubmit: (handler: () => void) => () => handler(),
};

vi.mock('@shared/api/addressApi', () => ({
  useLazyGetAddressDetailsQuery: () => [fetchDetailsMock],
  useCreateAddressMutation: () => [
    createAddressMock,
    { isLoading: false },
  ],
}));

vi.mock('@features/address-onboarding/hooks/useCountryMetadata', () => ({
  useCountryMetadata: () => countryState,
}));

vi.mock('@features/address-onboarding/hooks/useAddressSearch', () => ({
  useAddressSearch: () => searchState,
}));

vi.mock('@features/address-onboarding/hooks/useAddressForm', () => ({
  useAddressForm: () => formState,
}));

vi.mock('@features/address-onboarding/components/SavedAddressesSection', () => ({
  SavedAddressesSection: () => <div>Saved section</div>,
}));

vi.mock('@features/address-onboarding/components/AddressEntrySection', () => ({
  AddressEntrySection: ({ onManualEdit }: { onManualEdit: () => void }) => (
    <button onClick={onManualEdit} type="button">
      Manual Edit
    </button>
  ),
}));

vi.mock('@features/address-onboarding/components/AddressDetailsSection', () => ({
  AddressDetailsSection: ({
    enabled,
    onSubmit,
  }: {
    enabled: boolean;
    onSubmit: () => void;
  }) => (
    <div>
      <span>details-enabled:{String(enabled)}</span>
      <button onClick={onSubmit} type="button">
        Save Address
      </button>
    </div>
  ),
}));

describe('AddressOnboardingPage', () => {
  beforeEach(() => {
    fetchDetailsMock.mockReset();
    createAddressMock.mockReset();
    formState.applyPrefill.mockReset();
    formState.getValues.mockClear();
    formState.reset.mockClear();
    formState.trigger.mockClear();
    searchState.resetSearchState.mockReset();
    searchState.selectedPlaceId = 'usa_2';

    fetchDetailsMock.mockResolvedValue({
      data: { values: { line1: '1 Apple Park Way' } },
    });
    createAddressMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        id: 'addr_1',
      }),
    });
  });

  it('prefills from selected suggestion and allows submit', async () => {
    render(<AddressOnboardingPage />, { wrapper: MantineProvider });

    await waitFor(() => {
      expect(fetchDetailsMock).toHaveBeenCalledWith({
        placeId: 'usa_2',
        countryCode: 'USA',
      });
    });
    expect(formState.applyPrefill).toHaveBeenCalledWith({ line1: '1 Apple Park Way' });

    fireEvent.click(screen.getByRole('button', { name: 'Save Address' }));

    await waitFor(() => {
      expect(createAddressMock).toHaveBeenCalledWith({
        countryCode: 'USA',
        placeId: 'usa_2',
        values: { line1: '1 Apple Park Way' },
      });
    });
  });

  it('enables manual edit path when user clicks Manual Edit', async () => {
    searchState.selectedPlaceId = null;
    render(<AddressOnboardingPage />, { wrapper: MantineProvider });

    expect(screen.getAllByText('details-enabled:false').length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Manual Edit' })[0] as HTMLButtonElement);
    expect(screen.getAllByText('details-enabled:true').length).toBeGreaterThan(0);
  });
});
