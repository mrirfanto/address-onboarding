import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@app/store';

type AppProvidersProps = {
  children: ReactNode;
};

const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'blue',
  radius: {
    sm: '8px',
    md: '12px',
  },
});

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        {children}
      </MantineProvider>
    </Provider>
  );
}
