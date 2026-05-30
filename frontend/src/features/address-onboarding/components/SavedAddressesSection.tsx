import { Alert, Button, Card, Group, Skeleton, Stack, Text } from '@mantine/core';
import { useDeleteAddressMutation, useGetAddressesQuery } from '@shared/api/addressApi';

export function SavedAddressesSection() {
  const { data: addresses, isLoading, isError } = useGetAddressesQuery();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  if (isLoading) {
    return (
      <Card withBorder>
        <Stack gap="xs">
          <Text fw={600}>Saved Addresses</Text>
          <Skeleton height={18} radius="sm" />
          <Skeleton height={18} radius="sm" />
          <Skeleton height={18} radius="sm" />
        </Stack>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card withBorder>
        <Stack gap="xs">
          <Text fw={600}>Saved Addresses</Text>
          <Alert color="red" title="Failed to load addresses">
            Please refresh and try again.
          </Alert>
        </Stack>
      </Card>
    );
  }

  const rows = addresses ?? [];

  return (
    <Card withBorder>
      <Stack gap="xs">
        <Text fw={600}>Saved Addresses</Text>

        {rows.length === 0 ? (
          <Text c="dimmed" size="sm">
            No saved addresses yet.
          </Text>
        ) : (
          rows.map((row) => (
            <Group justify="space-between" key={row.id} wrap="nowrap">
              <Text size="sm">{row.display}</Text>
              <Button
                color="red"
                disabled={isDeleting}
                loading={isDeleting}
                onClick={() => {
                  void deleteAddress(row.id);
                }}
                size="xs"
                variant="light"
              >
                Delete
              </Button>
            </Group>
          ))
        )}
      </Stack>
    </Card>
  );
}
