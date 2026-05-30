import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedAddressesSection } from './SavedAddressesSection';

const useGetAddressesQueryMock = vi.fn();
const useDeleteAddressMutationMock = vi.fn();

vi.mock('@shared/api/addressApi', () => ({
  useGetAddressesQuery: () => useGetAddressesQueryMock(),
  useDeleteAddressMutation: () => useDeleteAddressMutationMock(),
}));

describe('SavedAddressesSection', () => {
  beforeEach(() => {
    useGetAddressesQueryMock.mockReset();
    useDeleteAddressMutationMock.mockReset();
  });

  it('renders saved address rows from query data', () => {
    useGetAddressesQueryMock.mockReturnValue({
      data: [
        {
          id: 'addr_1',
          countryCode: 'USA',
          placeId: 'usa_2',
          values: {},
          display: '1 Apple Park Way, Cupertino, CA 95014, United States',
          createdAt: '2026-05-30T10:00:00.000Z',
        },
      ],
      isLoading: false,
      isError: false,
    });
    useDeleteAddressMutationMock.mockReturnValue([vi.fn(), { isLoading: false }]);

    render(<SavedAddressesSection />, { wrapper: MantineProvider });

    expect(screen.getByText('Saved Addresses')).toBeInTheDocument();
    expect(screen.getByText('1 Apple Park Way, Cupertino, CA 95014, United States')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
