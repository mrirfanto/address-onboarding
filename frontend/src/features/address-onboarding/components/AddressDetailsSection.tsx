import { Badge, Card, Grid, Select, Stack, Text, TextInput } from '@mantine/core';
import type { MetadataField } from '@features/address-onboarding/types';

type AddressDetailsSectionProps = {
  fields: MetadataField[];
  loading: boolean;
  error: boolean;
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

export function AddressDetailsSection({ fields, loading, error }: AddressDetailsSectionProps) {
  return (
    <Card withBorder>
      <Stack gap="md">
        <Stack gap={2}>
          <Text fw={600}>Address Details</Text>
          <Text c="dimmed" size="sm">
            Dynamic fields are currently read-only. Manual editing will be enabled in a later slice.
          </Text>
        </Stack>

        {loading ? <Badge color="gray">Loading metadata...</Badge> : null}
        {error ? <Badge color="red">Failed to load metadata</Badge> : null}

        {!loading && !error ? (
          <Grid gutter="md">
            {fields.map((field) => {
              const description = buildDescription(field);
              const key = `dynamic-${field.key}`;

              if (field.type === 'select') {
                return (
                  <Grid.Col key={key} span={{ base: 12, md: 6 }}>
                    <Select
                      label={field.title}
                      required={field.required}
                      description={description || undefined}
                      placeholder={`Select ${field.title.toLowerCase()}`}
                      data={(field.options ?? []).map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      disabled
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
                    disabled
                  />
                </Grid.Col>
              );
            })}
          </Grid>
        ) : null}
      </Stack>
    </Card>
  );
}
