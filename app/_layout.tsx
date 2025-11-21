import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import 'expo-router/entry';

import { SessionProvider, useSession } from '../AuthContext';
import { Text } from '../components/Text';
import { SplashScreenController } from '../splash';
import { NAV_THEME } from '../theme';

const queryClient = new QueryClient();

function RootNavigator() {
  const { session, isLoading } = useSession();
  //const { colorScheme, isDarkColorScheme } = useColorScheme();

  if (isLoading) {
    return <Text /*variant="primary"*/>Loading...</Text>; // TODO: Loading screen
  }

  return (
    <NavThemeProvider value={NAV_THEME['light']}>
      <Stack>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" />
        </Stack.Protected>
      </Stack>
    </NavThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SplashScreenController />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}
