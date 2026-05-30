import { Button, Card, Grid, Select, Stack, Text, TextInput } from '@mantine/core';
import { Controller } from 'react-hook-form';
import { useAddressForm } from '@features/address-onboarding/hooks/useAddressForm';
import type { MetadataField } from '@features/address-onboarding/types';

type AddressDetailsSectionProps = {
  fields: MetadataField[];
  loading: boolean;
  error: boolean;
  enabled: boolean;
};

function buildDescription(field: MetadataField) {
  const parts: string[] = [];

  if (field.description) {
    parts.push(field.description);
  }
  if (field.prefix) {
    parts.push(`Prefix: ${field.prefix}`);
  }
  if (field.suffix) {
    parts.push(`Suffix: ${field.suffix}`);
  }

  return parts.join(' | ');
}

export function AddressDetailsSection({ fields, loading, error, enabled }: AddressDetailsSectionProps) {
  const form = useAddressForm({ fields, enabled });

  return (
    <Card withBorder>
      <Stack component="form" gap="md" onSubmit={form.onSubmit}>
        <Stack gap={2}>
          <Text fw={600}>Address Details</Text>
          <Text c="dimmed" size="sm">
            Complete the required fields. Validation runs when a field loses focus.
          </Text>
        </Stack>

        {loading ? <Text c="dimmed" size="sm">Loading metadata...</Text> : null}
        {error ? <Text c="red" size="sm">Failed to load metadata</Text> : null}

        {!loading && !error ? (
          <Grid gutter="md">
            {fields.map((field) => {
              const description = buildDescription(field);
              const key = `dynamic-${field.key}`;
              const fieldError = form.formState.errors[field.key]?.message;

              if (field.type === 'select') {
                return (
                  <Grid.Col key={key} span={{ base: 12, md: 6 }}>
                    <Controller
                      control={form.control}
                      name={field.key}
                      render={({ field: controlledField }) => (
                        <Select
                          label={field.title}
                          required={field.required}
                          description={description || undefined}
                          placeholder={`Select ${field.title.toLowerCase()}`}
                          data={(field.options ?? []).map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                          value={controlledField.value ?? ''}
                          onChange={(value) => controlledField.onChange(value ?? '')}
                          onBlur={controlledField.onBlur}
                          error={fieldError ? String(fieldError) : undefined}
                          disabled={!enabled}
                        />
                      )}
                    />
                  </Grid.Col>
                );
              }

              return (
                <Grid.Col key={key} span={{ base: 12, md: 6 }}>
                  <TextInput
                    label={field.title}
                    required={field.required}
                    description={description || undefined}
                    placeholder={`Enter ${field.title.toLowerCase()}`}
                    {...form.register(field.key)}
                    error={fieldError ? String(fieldError) : undefined}
                    disabled={!enabled}
                  />
                </Grid.Col>
              );
            })}
          </Grid>
        ) : null}

        <Button type="submit" disabled={!form.canSubmit}>
          Save Address
        </Button>
      </Stack>
    </Card>
  );
}
