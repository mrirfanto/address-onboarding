import { Card, Container, Divider, Stack, Text, Title } from '@mantine/core';

export function App() {
  return (
    <Container py="xl" size="md">
      <Stack gap="md">
        <Title order={1}>Global Address Onboarding</Title>
        <Text c="dimmed" size="sm">
          Country-based address capture with metadata-driven form rendering.
        </Text>
        <Divider />
        <Card withBorder>
          <Stack gap="xs">
            <Title order={3}>Address Entry</Title>
            <Text c="dimmed" size="sm">
              Address form and autocomplete flow will be implemented in the next slices.
            </Text>
          </Stack>
        </Card>
        <Card withBorder>
          <Stack gap="xs">
            <Title order={3}>Saved Addresses</Title>
            <Text c="dimmed" size="sm">
              Saved addresses list and actions will be connected in upcoming slices.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
