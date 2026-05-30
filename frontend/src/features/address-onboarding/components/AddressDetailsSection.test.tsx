import { fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';
import type { AddressFormState } from '@features/address-onboarding/hooks/useAddressForm';
import type { MetadataField } from '@features/address-onboarding/types';
import { AddressDetailsSection } from './AddressDetailsSection';

const fields: MetadataField[] = [
  {
    key: 'line1',
    title: 'Address Line 1',
    description: null,
    type: 'text',
    required: true,
    order: 1,
    prefix: null,
    suffix: null,
  },
  {
    key: 'city',
    title: 'City',
    description: null,
    type: 'text',
    required: true,
    order: 2,
    prefix: null,
    suffix: null,
  },
];

function TestHarness({ onSubmit }: { onSubmit: () => void }) {
  const form = {
    canSubmit: true,
    control: {},
    formState: {
      errors: {},
      isSubmitting: false,
      isValid: true,
    },
    handleSubmit: (handler: () => void) => (event?: { preventDefault: () => void }) => {
      event?.preventDefault();
      handler();
    },
    register: (key: string) => ({
      name: key,
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    }),
  } as unknown as AddressFormState;

  return (
    <AddressDetailsSection
      fields={fields}
      loading={false}
      error={false}
      enabled
      form={form}
      submitLabel="Save Address"
      submitLoading={false}
      submitMessage={null}
      onSubmit={onSubmit}
    />
  );
}

describe('AddressDetailsSection', () => {
  it('renders metadata fields and allows valid submit', async () => {
    const onSubmit = vi.fn();
    render(<TestHarness onSubmit={onSubmit} />, { wrapper: MantineProvider });

    fireEvent.submit(screen.getByRole('button', { name: 'Save Address' }).closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
